import { SegmentType, Boolean, MemoryAddress } from "../common/common";
import { IVirtualMachine, ICommand } from "./vm";
import { IStack } from "./stack";

/*
# Command

The VM language consists of four types of commands:

* Arithmetic commands: perform arithmetic and logical operations on the stack.

* Memory access commands: transfer data between the stack and virtual memory
segments.

* Program flow commands: facilitate conditional and unconditional branching
operations.

* Function calling commands: call functions and return from them.

*/

/*

## Arithmetic and Logical Commands

The VM language features **nine** stack-oriented arithmetic and logical commands.

**Seven** of these commands are binary: They pop two items off the stack, compute a binary function on them, and push the result back onto the stack. 

The remaining **two** commands are unary: they pop a single item off the stack, compute a unary function on it, and push the result back onto the stack.

*/

/*
### Integer Addition
*/

export class Add
{
}

<Add /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopTwoItems />;

    //@ts-ignore
    <PushSum />;

    //@ts-ignore
    <IncrementPC />;
};

/*
### Integer Subtraction
*/

export class Subtract
{
}

<Subtract /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopTwoItems />;

    //@ts-ignore
    <PushDifference />;

    //@ts-ignore
    <IncrementPC />;

};


/*
### Equality
*/

export class Equality
{
}

<Equality /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopTwoItems />;

    //@ts-ignore
    <PushEquality />;

    //@ts-ignore
    <IncrementPC />;
};


/*
### Greater Than
*/

export class GreaterThan
{
}

<GreaterThan /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopTwoItems />;

    //@ts-ignore
    <PushGreaterThanResult />;

    //@ts-ignore
    <IncrementPC />;
};


/*
### Less Than
*/

export class LessThan
{
}

<LessThan /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopTwoItems />;

    //@ts-ignore
    <PushLessThanResult />;

    //@ts-ignore
    <IncrementPC />;
};

/*
### Bitwise And
*/
export class And
{
}

<And /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopTwoItems />;

    //@ts-ignore
    <PushBitwiseAnd />;

    //@ts-ignore
    <IncrementPC />;
};


/*
### Bitwise Or
*/
export class Or
{
}

<Or /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopTwoItems />;

    //@ts-ignore
    <PushBitwiseOr />;

    //@ts-ignore
    <IncrementPC />;
};

/*
### Arithmetic Negation
*/


export class Negate
{
}

<Negate /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopOneItem />;

    //@ts-ignore
    <PushNegateResult />;

    //@ts-ignore
    <IncrementPC />;
};

/*
### Bitwise Not
*/

export class Not
{
}

<Not /> + function Execute(vm: IVirtualMachine)
{
    //@ts-ignore
    <PopOneItem />;

    //@ts-ignore
    <PushBitwiseNot />;

    //@ts-ignore
    <IncrementPC />;
};

/*
## Memory Access Commands

All the memory segments are accessed by the same two commands:

* push *segment index*: Push the value of segment[index] onto the stack.

* pop *segment index*: Pop the top stack value and store it in segment[index].

*/

/*
### Push
*/
export class Push
{
    m_Segment: SegmentType;
    m_Index: number;
}

<Push /> + function Execute(this: Push, vm: IVirtualMachine)
{
    vm.m_Stack.push(this.m_Segment, this.m_Index);

    //@ts-ignore
    <IncrementPC />;
};

/*
### Pop
*/
export class Pop
{
    m_Segment: SegmentType;
    m_Index: number;
}


<Pop /> + function Execute(this: Pop, vm: IVirtualMachine)
{
    vm.m_Stack.pop(this.m_Segment, this.m_Index);

    //@ts-ignore
    <IncrementPC />;
};

/*
## Program Flow Commands

* label *symbol* : Label declaration

* goto *symbol* : Unconditional branching

* if-goto *symbol* : Conditional branching

*/


/*
### Label
*/
export class Label
{
    m_Label: string;
    m_Pos: number;
}

<Label /> + function Execute(this: Label, vm: IVirtualMachine)
{
    vm.RegisterLabel(this.m_Label, this.m_Pos);
};

/*
### Goto
*/

export class Goto
{
    m_Label: string;
}

<Goto /> + function Execute(this: Goto, vm: IVirtualMachine)
{
    //@ts-ignore
    <JumpToLabel />;
};


/*
### If Goto
*/

export class IfGoto
{
    m_Label: string;
}

<IfGoto /> + function Execute(this: IfGoto, vm: IVirtualMachine)
{
    //@ts-ignore
    <CheckIfJump />;
};

/*
## Function Calling Commands

* function *functionName nLocals* : Function declaration, specifying the number of the function’s local variables

* call *functionName nArgs* : Function invocation, specifying the number of the function’s arguments

* return : Transfer control back to the calling function

*/

/*
### Function
*/

export class DeclareFunction
{
    m_Label: ILabel;
    m_LocalCount: number;
}

<DeclareFunction /> + function Execute(this: DeclareFunction, vm: IVirtualMachine)
{
    for (let i = 0; i < this.m_LocalCount; ++i)
    {
        vm.m_Stack.push("constant", 0);
    }

    //@ts-ignore
    <IncrementPC />;
};

/*
### Call
*/

/*

The convention of function call:

```dot
digraph g {
    graph [
        rankdir = "LR"
    ];

    node [
        fontsize = "16"
        shape = "ellipse"
    ];

    "node0" [
        label = " arg 0 | arg 1 | ... | arg n-1 | return address | saved local | saved arg | saved this | saved that | local 0 | local 1 | ... | local k-1"
        shape = "record"
    ];
}
``` 
*/

export class Call
{
    m_Label: string;
    m_ArgCount: number;
}

<Call /> + function Execute(this: Call, vm: IVirtualMachine)
{
    /**
     * push return address
     */
    vm.m_Stack.push("constant", vm.m_PC + 1);
    vm.m_Stack.push("constant", vm.m_Memory.Read(MemoryAddress.Local));
    vm.m_Stack.push("constant", vm.m_Memory.Read(MemoryAddress.Argument));
    vm.m_Stack.push("constant", vm.m_Memory.Read(MemoryAddress.This));
    vm.m_Stack.push("constant", vm.m_Memory.Read(MemoryAddress.That));

    /**
     * Reposition arg
     */
    vm.m_Memory.Write(MemoryAddress.Argument, vm.m_Stack.sp() - this.m_ArgCount - 5);

    /**
     * Reposition local
     */
    vm.m_Memory.Write(MemoryAddress.Local, vm.m_Stack.sp());

    //@ts-ignore
    <JumpToLabel />;
};

/*
### Return
*/

export class Return
{
}

<Return /> + function Execute(this: Return, vm: IVirtualMachine)
{
    const local_base = vm.m_Memory.Read(MemoryAddress.Local);

    //@ts-ignore
    <PrepareReturnAddress />;

    //@ts-ignore
    <PrepareReturnValue />;

    //@ts-ignore
    <RestoreSavedBaseAddresses />;

    //@ts-ignore
    <GoToReturnAddress />;
};

/*
# Appendix
*/

/*
## Trivial
*/

<Pop /> + function constructor(this: Pop, segment: SegmentType, index: number)
{
    this.m_Segment = segment;
    this.m_Index = index;
};

<Push /> + function constructor(this: Push, segment: SegmentType, index: number)
{
    this.m_Segment = segment;
    this.m_Index = index;
};

<Label /> + function constructor(this: Label, label: string)
{
    this.m_Label = label;
    this.m_Pos = null;
};

<Goto /> + function constructor(this: Goto, label: string)
{
    this.m_Label = label;
};

<IfGoto /> + function constructor(this: IfGoto, label: string)
{
    this.m_Label = label;
};

<Call /> + function constructor(this: Call, label: string, arg_count: number)
{
    this.m_Label = label;
    this.m_ArgCount = arg_count;
};

<DeclareFunction /> + function constructor(this: DeclareFunction, label: string, local_count: number)
{
    this.m_Label = Reflect.construct(Label, [label]);
    this.m_LocalCount = local_count;
};

/*
## Utility
*/
export interface ILabel extends ICommand
{
    SetPos(pos: number): void;
    Register(vm: IVirtualMachine, pos: number): void;
};

<Label /> + function SetPos(this: Label, pos: number)
{
    this.m_Pos = pos;
};

<Label /> + function Register(this: Label & ILabel, vm: IVirtualMachine, pos: number)
{
    this.SetPos(pos);
    this.Execute(vm);
};

<DeclareFunction /> + function RegisterLabel(this: DeclareFunction, vm: IVirtualMachine, pos: number)
{
    this.m_Label.Register(vm, pos);
};


/*
## Local Context
*/

/*
take value at top of stack, if equals 0, continue execution
*/
function CheckIfJump(vm: IVirtualMachine)
{
    const top = vm.m_Stack.pop();
    if (top === 0)
    {
        //@ts-ignore
        <IncrementPC />;
        return;
    }

    //@ts-ignore
    <JumpToLabel />;
}

function JumpToLabel(this: { m_Label: string }, vm: IVirtualMachine)
{
    const address = vm.ResolveLabel(this.m_Label);
    vm.Jump(address);
}

function PrepareReturnAddress(vm: IVirtualMachine, local_base: number)
{
    const return_address = vm.m_Memory.Read(local_base - 5);
}

/*
the convention is to put return value at the pos of first arg after return
 */
function PrepareReturnValue(vm: IVirtualMachine)
{
    const return_value = vm.m_Stack.pop();
    vm.m_Memory.Write(vm.m_Memory.Resolve("argument", 0), return_value);
}

/*
saved base addresses just like registers
*/
function RestoreSavedBaseAddresses(vm: IVirtualMachine, local_base: number)
{
    /**
     * restore sp to pos of arg+1, because after return we will put return value at arg
     */
    vm.m_Memory.Write(MemoryAddress.StackPointer, vm.m_Memory.Read(MemoryAddress.Argument) + 1);
    vm.m_Memory.Write(MemoryAddress.That, vm.m_Memory.Read(local_base - 1));
    vm.m_Memory.Write(MemoryAddress.This, vm.m_Memory.Read(local_base - 2));
    vm.m_Memory.Write(MemoryAddress.Argument, vm.m_Memory.Read(local_base - 3));
    vm.m_Memory.Write(MemoryAddress.Local, vm.m_Memory.Read(local_base - 4));
}

function GoToReturnAddress(vm: IVirtualMachine, return_address: number)
{
    vm.Jump(return_address);
}

function IncrementPC(vm: IVirtualMachine)
{
    vm.m_PC += 1;
}

function PopTwoItems(vm: IVirtualMachine)
{
    const stack = vm.m_Stack;
    const y = stack.pop();
    const x = stack.pop();
}

function PopOneItem(vm: IVirtualMachine)
{
    const stack = vm.m_Stack;
    const y = stack.pop();
}

function PushSum(stack: IStack, x: number, y: number)
{
    stack.push("constant", x + y);
}

function PushDifference(stack: IStack, x: number, y: number)
{
    stack.push("constant", x - y);
}

function PushNegateResult(stack: IStack, y: number)
{
    stack.push("constant", -y);
}

function PushEquality(stack: IStack, x: number, y: number)
{
    stack.push("constant", x === y ? Boolean.True : Boolean.False);
}

function PushLessThanResult(stack: IStack, x: number, y: number)
{
    stack.push("constant", x < y ? Boolean.True : Boolean.False);
}

function PushGreaterThanResult(stack: IStack, x: number, y: number)
{
    stack.push("constant", x > y ? Boolean.True : Boolean.False);
}

function PushBitwiseAnd(stack: IStack, x: number, y: number)
{
    stack.push("constant", x & y);
}

function PushBitwiseOr(stack: IStack, x: number, y: number)
{
    stack.push("constant", x | y);
}

function PushBitwiseNot(stack: IStack, y: number)
{
    stack.push("constant", ~y);
}