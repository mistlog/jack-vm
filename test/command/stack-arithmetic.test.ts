import { Push, Add, Equality, LessThan, Subtract, And, Or, Not, Negate, GreaterThan } from "../../src/core/command";
import { VirtualMachine, ICommand } from "../../src/core/vm";
import { Boolean } from "../../src/common/common";

describe("arithmetic and logical stack commands", () =>
{
    let vm: VirtualMachine = null;

    beforeEach(() =>
    {
        vm = new VirtualMachine();
    })

    test("command.arithmetic.add", () =>
    {
        Execute([
            new Push("constant", 7),
            new Push("constant", 8),
            new Add()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(15);
    })

    test("command.arithmetic.subtract", () =>
    {
        Execute([
            new Push("constant", 141),
            new Push("constant", 112),
            new Subtract()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(29);
    })

    test("command.arithmetic.negate", () =>
    {
        Execute([
            new Push("constant", 29),
            new Negate()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(-29);
    })

    test("command.logical.equality.1", () =>
    {
        Execute([
            new Push("constant", 17),
            new Push("constant", 17),
            new Equality()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(Boolean.True);
    })

    test("command.logical.equality.2", () =>
    {
        Execute([
            new Push("constant", 16),
            new Push("constant", 17),
            new Equality()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(Boolean.False);
    })

    test("command.logical.equality.3", () =>
    {
        Execute([
            new Push("constant", 17),
            new Push("constant", 16),
            new Equality()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(Boolean.False);
    })

    test("command.logical.less-than.1", () =>
    {
        Execute([
            new Push("constant", 892),
            new Push("constant", 891),
            new LessThan()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(Boolean.False);
    })

    test("command.logical.less-than.2", () =>
    {
        Execute([
            new Push("constant", 891),
            new Push("constant", 892),
            new LessThan()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(Boolean.True);
    })

    test("command.logical.less-than.3", () =>
    {
        Execute([
            new Push("constant", 891),
            new Push("constant", 891),
            new LessThan()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(Boolean.False);
    })

    test("command.logical.greater-than", () =>
    {
        Execute([
            new Push("constant", 892),
            new Push("constant", 891),
            new GreaterThan()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(Boolean.True);
    })

    test("command.logical.and", () =>
    {
        Execute([
            new Push("constant", 28),
            new Push("constant", 57),
            new And()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(24);
    })

    test("command.logical.or", () =>
    {
        Execute([
            new Push("constant", 24),
            new Push("constant", 82),
            new Or()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(90);
    })

    test("command.logical.not", () =>
    {
        Execute([
            new Push("constant", 90),
            new Not()
        ]);

        expect(vm.m_Memory.Read(256)).toEqual(-91);
    })

    function Execute(image: Array<ICommand>)
    {
        vm.Load(image);
        vm.Run();
    }
})
