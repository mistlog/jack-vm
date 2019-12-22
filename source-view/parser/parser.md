# Code Parser

The code parser transforms code to commands. For example, given code such as:

```js
push constant 1
push constant 2
add
```

we expect to get commands:

```js
[
    new Push("constant", 1),
    new Push("constant", 2),
    new Add()
]
```

## Represent Code and Command

```typescript
export class CodeParser {
    m_Code: Array<Array<string | number>>;
    static m_CommandTable: Map<string, Function>;
}
```

We don't need a complex parser, instead, we will simply manipulate string. The trick is to split source code and get tokens of it, ```m_Code``` would be:

```js
[
   ["push", "constant", 1],
   ["push", "constant", 2],
   ["add"]
]
```

To generate commands consistently, we need an auxiliary command table so that string "push" maps to class Push:

```js
{
    {"push": Push},
    {"add": Add},
    ...
}
```

## Initialize Parser

As we know how to represent code and commands, we will init them in the constructor.

```typescript
<CodeParser /> +
    function constructor(this: CodeParser, code: string, file?: string) {
        <PreprocessCode />;
        <PrepareCommandTable />;
    };
```

## Parse and Return Commands

```typescript
<CodeParser /> +
    function Parse(this: CodeParser) {
        const commands = this.m_Code.reduce((commands: Array<ICommand>, code: Array<string | number>) => {
            const [name, ...args] = code as [string, ...Array<string | number>];
            if (CodeParser.m_CommandTable.has(name)) {
                <ConstructCommand />;
            }
            return commands;
        }, []);
        return commands;
    };
```

# Appendix

## Utility

```typescript
export interface ICodeParser {
    Parse(): Array<ICommand>;
}
```

## Local Context

### Preprocess Code

We will do the dirty work now.

```typescript
function PreprocessCode(this: CodeParser, code: string, file?: string) {
    <Tokenize />;
    <HandleLabel />;
}
```

#### Tokenize

```typescript
function Tokenize(this: CodeParser, code: string, file?: string) {
    <RemoveWhiteSpace />;
    <HandleStatic />;
    <SplitAndParse />;
}
```

```typescript
function RemoveWhiteSpace(this: CodeParser, code: string) {
    let lines = code
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "");
}
```

This is related to the implementation of static in jack vm. Refer to the book for details.

```typescript
function HandleStatic(lines: Array<string>, file?: string) {
    const prefix = file ? `${file}.` : "";
    lines = lines.map(line => line.replace(/static/g, `${prefix}static`));
}
```

```typescript
function SplitAndParse(this: CodeParser, lines: Array<string>) {
    this.m_Code = lines.map(line =>
        line.split(/[ ]+/).map(each => {
            const value = Number.parseInt(each);
            return Number.isNaN(value) ? each : value;
        })
    ) as Array<Array<string | number>>;
}
```

#### Handle Label

As we can use the same label name in different function, we have to add prefix to differentiate it.

For example, the function name would be the prefix and added to ```IF_TRUE0```:

```js
code : `
    function Test1 3
    label IF_TRUE0
    function Test2 2
    label IF_TRUE0
`

commands : [
    new DeclareFunction("Test1", 3),
    new Label("Test1$IF_TRUE0"),
    new DeclareFunction("Test2", 2),
    new Label("Test2$IF_TRUE0")
]
```

In this way, when we use the label, we have to add the prefix:

```js
code : `
    function Test1 3
    label IF_TRUE0
    goto IF_TRUE0
    function Test2 2
    goto IF_TRUE0
    label IF_TRUE0
`

commands : [
    new DeclareFunction("Test1", 3),
    new Label("Test1$IF_TRUE0"),
    new Goto("Test1$IF_TRUE0"),
    new DeclareFunction("Test2", 2),
    new Goto("Test2$IF_TRUE0"),
    new Label("Test2$IF_TRUE0")
]
```

We will scan ```m_Code``` twice. In the first pass, we will build a label map to record the relations between label and the function it belongs to. In the second pass, we will deal with command such as ```goto label``` to add scope to label.

The reason is that we may use the label before we declare it.

```typescript
function HandleLabel(this: CodeParser) {
    <ConstructLabelMap />;
    <UseLabelMap />;
}
```

Example of label map:

```js
{
    Test1: {
        {IF_TRUE0: Test1$IF_TRUE0}
    },
    Test2: {
        {IF_TRUE0: Test2$IF_TRUE0}
    }
}
```

```typescript
function ConstructLabelMap(this: CodeParser) {
    const label_map = new Map();
    let current_function = null;
    this.m_Code.forEach(code => {
        const [name, ...args] = code;
        if (name === "function") {
            const [function_name] = args as [string];
            current_function = function_name;
            label_map.set(current_function, new Map());
        } else if (name === "label" && current_function !== null) {
            const [label] = args as [string];
            const scoped_label = `${current_function}$${label}`;
            const labels = label_map.get(current_function);
            labels.set(label, scoped_label);
        }
    });
}
```

```typescript
function UseLabelMap(this: CodeParser, current_function: string, label_map: Map<string, Map<string, string>>) {
    current_function = null;
    this.m_Code = this.m_Code.map(code => {
        const [name, ...args] = code as [string, ...Array<string | number>];
        if (name === "function") {
            const [function_name] = args as [string];
            current_function = function_name;
        } else if (current_function !== null) {
            if (["goto", "if-goto", "label"].includes(name)) {
                const [label] = args as [string];
                const scoped_label = label_map.get(current_function).get(label);
                return [name, scoped_label];
            }
        }
        return code;
    });
}
```

### Trival

```typescript
function ConstructCommand(commands: Array<ICommand>, name: string, args: Array<string | number>) {
    const Command = CodeParser.m_CommandTable.get(name);
    commands.push(Reflect.construct(Command, args));
}
```

```typescript
function PrepareCommandTable() {
    if (!CodeParser.m_CommandTable) {
        CodeParser.m_CommandTable = new Map<string, Function>([
            /**
             * arithmetic and logical stack commands.
             */
            ["add", Add],
            ["sub", Subtract],
            ["neg", Negate],
            ["eq", Equality],
            ["gt", GreaterThan],
            ["lt", LessThan],
            ["and", And],
            ["or", Or],
            ["not", Not],

            /**
             * memory access commands
             */
            ["push", Push],
            ["pop", Pop],

            /**
             * program flow commands
             */
            ["label", Label],
            ["goto", Goto],
            ["if-goto", IfGoto],

            /**
             * function commands
             */
            ["return", Return],
            ["call", Call],
            ["function", DeclareFunction]
        ]);
    }
}
```