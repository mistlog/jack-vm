import { VirtualMachine, ICommand } from "../../src/core/vm";
import { readFileSync, writeFileSync } from "fs";
import { DefaultConfig } from "../../src/common/common";
import { ScreenToPNG, MakeImage, ReadMemory, Execute as ExecuteUtility } from "../common/utility/utility";
import { PNG } from "pngjs";


describe("vm", () =>
{
    let vm: VirtualMachine = null;
    let os_image: Array<ICommand> = null;

    beforeEach(() =>
    {
        vm = new VirtualMachine();
        os_image = [];

        ["Sys", "Array", "Keyboard", "Math", "Memory", "Output", "Screen", "String"].forEach(each =>
        {
            const image = MakeImage(each, "os");
            os_image.push(...image)
        })
    })

    test("trival.sum", () =>
    {
        Execute("sum");
        expect(ReadMemory(vm, DefaultConfig.StackPointerAddress)).toEqual(3);
    })

    test("math.multiply", () =>
    {
        Execute("seven");
        expect(ReadMemory(vm, DefaultConfig.StackPointerAddress)).toEqual(7);
    })

    test("array", () =>
    {
        Execute("array");
        expect(ReadMemory(vm, [8000, 8000 + 4])).toEqual([
            222, 122, 100, 10
        ]);
    })

    test("math", () =>
    {
        Execute("math");
        expect(ReadMemory(vm, [8000, 8000 + 14])).toEqual([
            6, -180, -18000, -18000, 0, 3, -3000, -0, 3, 181, 123, 123, 27, 32767
        ]);

        // that's why we use -0 in toEqual
        expect(-0).not.toEqual(0);
    })

    test("memory", () =>
    {
        Execute("memory");
        expect(ReadMemory(vm, [8000, 8000 + 6])).toEqual([
            333, 334, 222, 122, 100, 10
        ]);
    })

    test("screen", () =>
    {
        SnapshotTest("screen");
    })
    test("output", () =>
    {
        SnapshotTest("output");
    })

    test("string", () =>
    {
        SnapshotTest("string");
    })

    function Execute(name: string)
    {
        const app_image = MakeImage(name, "app");
        os_image.push(...app_image);
        ExecuteUtility(vm, os_image, 12);
    }

    function SnapshotTest(name: string)
    {
        Execute(name);

        const screen = vm.m_Memory.Dump(DefaultConfig.ScreenAddress, DefaultConfig.ScreenAddress + DefaultConfig.PixelCount);
        //writeFileSync(`${__dirname}/asset/${name}.json`, JSON.stringify({ data: screen }, null, 4), "utf8");
        expect({ data: screen }).toEqual(JSON.parse(ReadFile(`to-compare/${name}.json`)));

        //
        const png = ScreenToPNG(screen);
        WriteFile(`out/${name}.png`, PNG.sync.write(png, { colorType: 6 }));
    }
})

function ReadFile(name: string)
{
    return readFileSync(`${__dirname}/../common/${name}`, "utf8")
}

function WriteFile(name: string, buffer: Buffer)
{
    writeFileSync(`${__dirname}/../common/${name}`, buffer);
}