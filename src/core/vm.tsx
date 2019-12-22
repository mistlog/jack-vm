import { MemoryAddress, DefaultConfig } from "../common/common";
import { Label, Return, DeclareFunction, Call, IfGoto } from "./command";
import { Memory, IMemory } from "./memory";
import { IStack, Stack } from "./stack";

/*
# Virtual Machine

The interface of vm is simple, just load commands and run. The predicate is used in test to set breakpoint.

*/
export interface IVirtualMachine
{
    Load(image: Image): void;
    Run(predicate?: Function): void;

    m_Stack: IStack;
    m_Memory: IMemory;
    
    /**
     * program conter: current command index
     */
    m_PC: number;
};

export type Image = Array<ICommand>;

export interface ICommand
{
    Execute: (vm: IVirtualMachine) => void;
};

/*
## Represent Virtual Machine
*/
export class VirtualMachine
{
    m_Memory: IMemory;
    m_Stack: IStack;
    m_PC: number;

    //
    m_CommandList: Array<ICommand>;
    m_Labels: Map<string, number>;
}

/*
Internally, we will not store commands in memory, instaed, we will maintain a command list separately. This is different from the world of x86, where data and command are treated equally as binary sequence in memory.

*/

/*
## Load
*/
<VirtualMachine /> + function Load(this: VirtualMachine & IVirtualMachine, image: Image)
{

    const reduced = image.reduce((commands: Array<ICommand>, current: ICommand) =>
    {
        //@ts-ignore
        <HandleLabelRelated />;

        commands.push(current);
        return commands;
    }, []);

    this.m_CommandList.push(...reduced);
};

/*
## Run
*/
<VirtualMachine /> + function Run(this: VirtualMachine & IVirtualMachine, predicate?: Function)
{
    for (; ;)
    {
        //@ts-ignore
        <CheckIfStop />;
        <ExecuteCommand />;
    }
};

/*
## Utility
*/
export interface IVirtualMachine
{
    RegisterLabel(label: string, pos: number): void;
    ResolveLabel(label: string): number;
    Jump(address: number): void;
    Step(): void;
};

<VirtualMachine /> + function Step(this: VirtualMachine & IVirtualMachine)
{
    const command = this.m_CommandList[this.m_PC];
    command.Execute(this);
};

<VirtualMachine /> + function Jump(this: VirtualMachine, address: number)
{
    this.m_PC = address;
};

<VirtualMachine /> + function ResolveLabel(this: VirtualMachine, label: string)
{
    return this.m_Labels.get(label);
};

<VirtualMachine /> + function RegisterLabel(this: VirtualMachine, label: string, pos: number)
{
    this.m_Labels.set(label, pos);
};

/*
# Appendix
*/

/*
## Trivial
*/

<VirtualMachine /> + function constructor(this: VirtualMachine)
{
    //
    this.m_Memory = new Memory(DefaultConfig.MemorySize);
    this.m_Memory.Write(MemoryAddress.StackPointer, DefaultConfig.StackPointerAddress);
    this.m_Stack = new Stack(this.m_Memory);

    //
    this.m_CommandList = [];
    this.m_PC = 0;
    this.m_Labels = new Map<string, number>();
};

/*
## Local Context
*/
function CheckIfStop(this: VirtualMachine, predicate?: Function)
{
    if (predicate && predicate(this))
    {
        return;
    }

    if (this.m_PC >= this.m_CommandList.length)
    {
        return;
    }
}

function ExecuteCommand(this: VirtualMachine & IVirtualMachine)
{
    this.Step();
}

function HandleLabelRelated(this: VirtualMachine & IVirtualMachine, current: ICommand, commands: Array<ICommand>)
{
    const index = commands.length;
    if (current instanceof Label)
    {
        current.Register(this, index);
        return commands;
    }
    else if (current instanceof DeclareFunction)
    {
        current.RegisterLabel(this, index);
    }
}