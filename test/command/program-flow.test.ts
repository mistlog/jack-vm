import { VirtualMachine } from "../../src/core/vm";
import { MemoryAddress } from "../../src/common/common";
import { Label, Push, Goto, IfGoto } from "../../src/core/command";
import { Execute, ReadMemory, ConfigMemory, MakeImage } from "../common/utility/utility";

describe("program flow", () =>
{

    let vm: VirtualMachine = null;

    beforeEach(() =>
    {
        vm = new VirtualMachine();
    })

    test("label: register label correctly", () =>
    {
        const image = [
            new Label("START"),
            new Push("constant", 7)
        ];

        Execute(vm, image);

        expect(vm.m_Labels.get("START")).toEqual(0);
    })

    test("label.goto", () =>
    {
        const image = [
            new Goto("END"),
            new Push("constant", 7),
            new Push("constant", 8),
            new Push("constant", 9),
            new Label("END")
        ];

        Execute(vm, image);

        expect(ReadMemory(vm, MemoryAddress.StackPointer)).toEqual(256);
    })

    test("label.if-goto", () =>
    {
        const image = [
            new Push("constant", 8),
            new Push("constant", 7),
            new IfGoto("END"),
            new Push("constant", 9),
            new Label("END")
        ];

        Execute(vm, image);

        expect(ReadMemory(vm, MemoryAddress.StackPointer)).toEqual(257);
    })

    // This test is part of www.nand2tetris.org
    // and the book "The Elements of Computing Systems"
    // by Nisan and Schocken, MIT Press.
    // File name: projects/08/ProgramFlow/BasicLoop/BasicLoop.vm

    // Computes the sum 1 + 2 + ... + argument[0] and pushes the 
    // result onto the stack. Argument[0] is initialized by the test 
    // script before this code starts running.
    test("program-flow.basic-loop", () =>
    {
        //
        ConfigMemory(vm, [
            [MemoryAddress.Local, 300],
            [MemoryAddress.Argument, 400],
            [["argument", 0], 100]
        ]);

        const image = MakeImage("program-flow.basic-loop");
        Execute(vm, image);

        expect(ReadMemory(vm, MemoryAddress.StackPointer)).toEqual(257);
        expect(ReadMemory(vm, 256)).toEqual(5050);
    })

    // This test is part of www.nand2tetris.org
    // and the book "The Elements of Computing Systems"
    // by Nisan and Schocken, MIT Press.
    // File name: projects/08/ProgramFlow/FibonacciSeries/FibonacciSeries.vm

    // Puts the first argument[0] elements of the Fibonacci series
    // in the memory, starting in the address given in argument[1].
    // Argument[0] and argument[1] are initialized by the test script 
    // before this code starts running.

    test("program-flow.fibonacci", () =>
    {
        //
        ConfigMemory(vm, [
            [MemoryAddress.Local, 300],
            [MemoryAddress.Argument, 400],
            [["argument", 0], 8],
            [["argument", 1], 3000]
        ])

        const image = MakeImage("program-flow.fibonacci");
        Execute(vm, image);

        expect(vm.m_Memory.Dump(3000, 3000 + 8)).toEqual([
            0, 1, 1, 2, 3, 5, 8, 13
        ]);
    })
})