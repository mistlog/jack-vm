import { IMemory } from "./memory";
import { SegmentType, MemoryAddress } from "../common/common";

/*
# Stack

Stack acts as a proxy of a piece of memory, which provide push and pop to systematically access memory.

*/
export interface IStack
{
    sp(): number;
    push(segment: SegmentType, index: number): Stack & IStack;
    pop(segment?: SegmentType, index?: number): number;
};

/*
## Represent Stack
*/
export class Stack
{
    m_Memory: IMemory;
}

<Stack /> + function push(this: Stack & IStack, segment: SegmentType, index: number)
{
    const sp = this.sp();

    if (segment === "constant")
    {
        this.m_Memory.Write(sp, index);
    }
    else
    {
        const address = this.m_Memory.Resolve(segment, index);
        const value = this.m_Memory.Read(address);
        this.m_Memory.Write(sp, value)
    }

    this.m_Memory.Write(MemoryAddress.StackPointer, sp + 1);
    return this;
};

<Stack /> + function pop(this: Stack & IStack, segment?: SegmentType, index?: number)
{
    this.m_Memory.Write(MemoryAddress.StackPointer, this.sp() - 1);
    const top = this.m_Memory.Read(this.sp());

    if (segment)
    {
        const target = this.m_Memory.Resolve(segment, index);
        this.m_Memory.Write(target, top);
    }

    return top;
};

/*
# Appendix
*/

/*
## Trivial
*/
<Stack /> + function constructor(this: Stack, memory: IMemory)
{
    this.m_Memory = memory;
};

<Stack /> + function sp(this: Stack)
{
    return this.m_Memory.Read(MemoryAddress.StackPointer);
};