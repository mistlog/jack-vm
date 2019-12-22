import { Memory, IMemory } from "../../src/core/memory";
import { Stack, IStack } from "../../src/core/stack";
import { MemoryAddress, DefaultConfig } from "../../src/common/common";
import { ConfigMemory, ReadMemory } from "../common/utility/utility";

describe("stack", () =>
{
    let memory: IMemory = null;
    let stack: IStack = null;

    beforeEach(() =>
    {
        memory = new Memory(DefaultConfig.MemorySize);
        ConfigMemory(memory, [
            [MemoryAddress.StackPointer, 256],
            [MemoryAddress.Local, 300],
            [MemoryAddress.Argument, 400],
            [MemoryAddress.That, 3000],
            [MemoryAddress.That, 3010]
        ]);
        stack = new Stack(memory);
    })

    test("memory", () =>
    {
        memory.Write(123, 456)

        expect(ReadMemory(memory, 123)).toEqual(456);
    })

    test("stack.push", () =>
    {
        stack.push("constant", 7);

        expect(ReadMemory(memory, 256)).toEqual(7);
        expect(ReadMemory(memory, MemoryAddress.StackPointer)).toEqual(257);
    })

    test("stack.pop.local", () =>
    {
        stack.push("constant", 10)
            .pop("local", 0);

        expect(ReadMemory(memory, 256)).toEqual(10);
        expect(ReadMemory(memory, MemoryAddress.StackPointer)).toEqual(256);

        const address = memory.Resolve("local", 0);
        expect(ReadMemory(memory, address)).toEqual(10);
    })

    test("stack.pop.argument", () =>
    {
        stack.push("constant", 22)
            .pop("argument", 2);

        expect(ReadMemory(memory, ["argument", 2])).toEqual(22);
    })

    test("stack.pop.this", () =>
    {
        stack.push("constant", 36)
            .pop("this", 6);

        expect(ReadMemory(memory, ["this", 6])).toEqual(36);
    })

    test("stack.pop.that", () =>
    {
        stack.push("constant", 45)
            .pop("that", 5);

        expect(ReadMemory(memory, ["that", 5])).toEqual(45);
    })

    test("stack.pop.temp", () =>
    {
        stack.push("constant", 46)
            .pop("temp", 4);

        expect(ReadMemory(memory, ["temp", 4])).toEqual(46);
    })

    test("stack.pop.pointer.this", () =>
    {
        stack.push("constant", 3030)
            .pop("pointer", 0);

        expect(ReadMemory(memory, MemoryAddress.This)).toEqual(3030);
    })

    test("stack.pop.pointer.that", () =>
    {
        stack.push("constant", 3040)
            .pop("pointer", 1);

        expect(ReadMemory(memory, MemoryAddress.That)).toEqual(3040);
    })

    test("stack.push.pointer.this", () =>
    {
        memory.Write(MemoryAddress.This, 123);
        stack.push("pointer", 0);
        const value = stack.pop();
        expect(value).toEqual(123);
    })

    test("stack.push.pointer.that", () =>
    {
        memory.Write(MemoryAddress.That, 456);
        stack.push("pointer", 1);
        const value = stack.pop();
        expect(value).toEqual(456);
    })

    test("stack.push.this", () =>
    {
        memory.Write(memory.Resolve("this", 2), 123);
        stack.push("this", 2);
        const value = stack.pop();
        expect(value).toEqual(123);
    })

    test("stack.push.that", () =>
    {
        memory.Write(memory.Resolve("that", 6), 456);
        stack.push("that", 6);
        const value = stack.pop();
        expect(value).toEqual(456);
    })

    test("stack.push.static", () =>
    {
        memory.Write(memory.Resolve("static", 3), 123);
        stack.push("static", 3);
        const value = stack.pop();
        expect(value).toEqual(123);
    })

    test("stack.push.file.static", () =>
    {
        memory.Write(memory.Resolve("foo.vm.static", 3), 123);
        stack.push("foo.vm.static", 3);
        const value = stack.pop();
        expect(value).toEqual(123);
    })

    test("stack.pop.static", () =>
    {
        stack.push("constant", 3040)
            .pop("static", 3);

        expect(ReadMemory(memory, ["static", 3])).toEqual(3040);
    })

    test("stack.pop.file.static", () =>
    {
        stack.push("constant", 3040)
            .pop("foo.vm.static", 3);

        expect(ReadMemory(memory, ["foo.vm.static", 3])).toEqual(3040);
    })
})