import { CodeParser } from "../../src/parser/parser";
import { Push, Add, Pop, Label, IfGoto, Subtract, DeclareFunction, Goto } from "../../src/core/command";
import { ICommand } from "../../src/core/vm";

describe("parser", () =>
{
    test("parser.constructor", () =>
    {
        const code = `
            push constant 1
            push constant 2
            add
        `;

        const expected = [
            ["push", "constant", 1],
            ["push", "constant", 2],
            ["add"]
        ];

        TestPreprocessCode(code, expected);
    })

    test("parser.preprocess.static: preprocess code with static segment", () =>
    {
        const code = `
            push static 1
            pop static 0
        `;

        const expected = [
            ["push", "static", 1],
            ["pop", "static", 0]
        ];

        TestPreprocessCode(code, expected);
    })

    test("parser.preprocess.static.file: preprocess code with file name, expected to add file name as prefix to static segment", () =>
    {
        const code = `
            push static 1
            pop static 0
        `;

        const expected = [
            ["push", "foo.vm.static", 1],
            ["pop", "foo.vm.static", 0]
        ];

        TestPreprocessCode(code, expected, "foo.vm");
    })

    test("parser.parse.simple", () =>
    {
        const code = `
            push constant 1
            push constant 2
            add
        `;

        const expected = [
            new Push("constant", 1),
            new Push("constant", 2),
            new Add()
        ];

        TestParseCode(code, expected);
    })

    test("parser.parse.control-flow", () =>
    {
        const code = `
            push constant 0    
            pop local 0       
            label LOOP_START
            push argument 0    
            push local 0
            add
            pop local 0	   
            push argument 0
            push constant 1
            sub
            pop argument 0     
            push argument 0
            if-goto LOOP_START
            push local 0
        `;

        const expected = [
            new Push("constant", 0),
            new Pop("local", 0),
            new Label("LOOP_START"),
            new Push("argument", 0),
            new Push("local", 0),
            new Add(),
            new Pop("local", 0),
            new Push("argument", 0),
            new Push("constant", 1),
            new Subtract(),
            new Pop("argument", 0),
            new Push("argument", 0),
            new IfGoto("LOOP_START"),
            new Push("local", 0)
        ];

        TestParseCode(code, expected);
    })

    test("parser.parse.function", () =>
    {
        const code = `
            function Test 3
        `;

        const expected = [
            new DeclareFunction("Test", 3)
        ];

        TestParseCode(code, expected);
    })

    test("parser.parse.function.label: the same label name should be added function name as prefix", () =>
    {
        const code = `
            function Test1 3
            label IF_TRUE0
            function Test2 2
            label IF_TRUE0
        `;

        const expected = [
            new DeclareFunction("Test1", 3),
            new Label("Test1$IF_TRUE0"),
            new DeclareFunction("Test2", 2),
            new Label("Test2$IF_TRUE0")
        ];

        TestParseCode(code, expected, "foo");
    })

    test("parser.parse.function.goto: prefix should be added to label name in goto", () =>
    {
        const code = `
            function Test1 3
            label IF_TRUE0
            goto IF_TRUE0
            function Test2 2
            goto IF_TRUE0
            label IF_TRUE0
        `;

        const expected = [
            new DeclareFunction("Test1", 3),
            new Label("Test1$IF_TRUE0"),
            new Goto("Test1$IF_TRUE0"),
            new DeclareFunction("Test2", 2),
            new Goto("Test2$IF_TRUE0"),
            new Label("Test2$IF_TRUE0")
        ];

        TestParseCode(code, expected, "foo");
    })
})

/**
 * utility
 */
function TestPreprocessCode(code: string, expected: Array<Array<string | number>>, file = "")
{
    const parser = new CodeParser(code, file);
    expect(parser.m_Code).toEqual(expected);
}

function TestParseCode(code: string, expected: Array<ICommand>, file = "")
{
    const image = new CodeParser(code, file).Parse();
    expect(image).toEqual(expected);
}