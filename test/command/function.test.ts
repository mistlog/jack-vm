import { VirtualMachine, IVirtualMachine } from "../../src/core/vm";
import { MemoryAddress } from "../../src/common/common";
import { Execute, ReadMemory, ConfigMemory, MakeImage } from "../common/utility/utility";

describe("function related command", () =>
{
    let vm: IVirtualMachine = null;

    beforeEach(() =>
    {
        vm = new VirtualMachine();
    })

    test("function.declare", () =>
    {
        const image = MakeImage("function.declare")
        Execute(vm, image);
        expect(ReadMemory(vm, MemoryAddress.StackPointer)).toEqual(256 + 3);
    })

    // This test is part of www.nand2tetris.org
    // and the book "The Elements of Computing Systems"
    // by Nisan and Schocken, MIT Press.
    // File name: projects/08/FunctionCalls/SimpleFunction/SimpleFunction.vm

    // Performs a simple calculation and returns the result.
    test("function.simple", () =>
    {
        ConfigMemory(vm, [
            [MemoryAddress.StackPointer, 317],
            [MemoryAddress.Local, 317],
            [MemoryAddress.Argument, 310],
            [MemoryAddress.This, 3000],
            [MemoryAddress.That, 4000],
            [["argument", 0], 1234],
            [["argument", 1], 37],
            [["argument", 2], 9],
            [["argument", 3], 305],
            [["argument", 4], 300],
            [["argument", 5], 3010],
            [["argument", 6], 4010],
        ]);

        const image = MakeImage("function.simple");
        vm.Load(image);

        /**
         * we don't use Execute here because the last command is "return",
         * but we didn't actually call this function at the first place
         */
        for (let i = 0; i < image.length; ++i)
        {
            vm.Step();
        }

        expect(ReadMemory(vm, [0, 0 + 5])).toEqual([
            311, 305, 300, 3010, 4010
        ]);
        expect(ReadMemory(vm, 310)).toEqual(1196);
    })

    test("function.call.simple", () =>
    {
        ConfigMemory(vm, [
            [MemoryAddress.StackPointer, 261]
        ]);

        const image = MakeImage("function.call.simple");
        Execute(vm, image);

        expect(vm.m_PC).toEqual(1);
        expect(ReadMemory(vm, MemoryAddress.StackPointer)).toEqual(262);
        expect(ReadMemory(vm, 261)).toEqual(3);
    })

    // Sys.vm for NestedCall test.
    //
    // Copyright (C) 2013 Mark A. Armbrust.
    // Permission granted for educational use.

    // Sys.init() calls Sys.main(), stores the return value in temp 1,
    //  and enters an infinite loop.

    // File name: projects/08/FunctionCalls/NestedCall/Sys.vm
    test("function.call.nested", () =>
    {
        ConfigMemory(vm, [
            [0, 261],
            [1, 261],
            [2, 256],
            [3, 3000],
            [4, 4000],
            [256, 1234],
            [257, -1],
            [258, -1],
            [259, -1],
            [260, -1]
        ]);

        const image = MakeImage("function.call.nested");
        Execute(vm, image);

        expect(ReadMemory(vm, 0)).toEqual(261);
        expect(ReadMemory(vm, 1)).toEqual(261);
        expect(ReadMemory(vm, 2)).toEqual(256);
        expect(ReadMemory(vm, 5)).toEqual(135);
        expect(ReadMemory(vm, 6)).toEqual(246);
    })

    // adapted from:

    // This test is apart of www.nand2tetris.org
    // and the book "The Elements of Computing Systems"
    // by Nisan and Schocken, MIT Press.
    // File name: projects/08/FunctionCalls/FibonacciElement/Sys.vm

    // Pushes n onto the stack and calls the Main.fibonacii function,
    // which computes the n'th element of the Fibonacci series.
    // The Sys.init function is called "automatically" by the 
    // bootstrap code.

    test("function.call.fibonacci: the 9th number of fibo is 34", () =>
    {
        ConfigMemory(vm, [
            [MemoryAddress.StackPointer, 261]
        ]);

        const image = MakeImage("function.call.fibonacci");
        Execute(vm, image);

        expect(ReadMemory(vm, MemoryAddress.StackPointer)).toEqual(262);
        expect(ReadMemory(vm, 261)).toEqual(34);
    })

    // This test is part of www.nand2tetris.org
    // and the book "The Elements of Computing Systems"
    // by Nisan and Schocken, MIT Press.
    // File name: projects/08/FunctionCalls/StaticsTest/Sys.vm

    // Tests that different functions, stored in two different 
    // class files, manipulate the static segment correctly. 
    test("function.static", () =>
    {
        ConfigMemory(vm, [
            [MemoryAddress.StackPointer, 261]
        ]);

        const class1_image = MakeImage("function.static.class-1");
        const class2_image = MakeImage("function.static.class-2");
        const main_image = MakeImage("function.static.main");
        const image = [...class1_image, ...class2_image, ...main_image];

        vm.m_PC = 24;
        Execute(vm, image);

        expect(ReadMemory(vm, MemoryAddress.StackPointer)).toEqual(263);
        expect(ReadMemory(vm, 261)).toEqual(-2);
        expect(ReadMemory(vm, 262)).toEqual(8);
    })
})