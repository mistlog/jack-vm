import { PNG } from "pngjs";
import { IVirtualMachine, ICommand } from "../../../src/core/vm";
import { CodeParser } from "../../../src/parser/parser";
import { readFileSync } from "fs";
import { IMemory } from "../../../src/core/memory";
import { isString } from "util";

export function MakeImage(name: string, type = "snippet")
{
    const ReadFile = (name: string) => readFileSync(`${__dirname}/../${name}`, "utf8");
    return new CodeParser(ReadFile(`${type}/${name}.vm`), name).Parse();
}

// Desc: Description
type MemoryDesc = [number, number] | [[string, number], number]

function isIVirtualMachine(object: Object): object is IVirtualMachine
{
    return "Run" in object;
}

export function ConfigMemory(source: IVirtualMachine | IMemory, config: Array<MemoryDesc>)
{
    const memory = isIVirtualMachine(source) ? source.m_Memory : source;

    config.forEach(desc =>
    {
        const [address, value] = desc;
        const address_value = Array.isArray(address) ? memory.Resolve(...address) : address;
        memory.Write(address_value, value);
    })
}

export function ReadMemory(source: IVirtualMachine | IMemory, at: number | [number, number] | [string, number])
{
    const memory = isIVirtualMachine(source) ? source.m_Memory : source;

    if (Array.isArray(at))
    {
        const [first, second] = at;
        if (isString(first))
        {
            const address = memory.Resolve(first, second);
            return memory.Read(address);
        }
        else
        {
            return memory.Dump(first, second);
        }
    }

    return memory.Read(at as number);
}

export function Execute(vm: IVirtualMachine, image: Array<ICommand>, break_point?: number, timeout = 10000)
{
    const startTime = new Date().getTime();
    vm.Load(image);

    // we need to set break point here to compare memory status just after return from main in vm.test
    vm.Run((vm: IVirtualMachine) => vm.m_PC === break_point || (new Date().getTime() - startTime) >= timeout);
}

/**
 * eg: length = 16, low -> high
 * 
 *  3: [ 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 * 
 * -3: [ 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]
 * 
 * @see {https://stackoverflow.com/a/16155417}
 */
export function ToBitArray(value: number, length: number)
{
    const bits = (value < 0 ? (value >>> 0).toString(2) : value.toString(2)).split("").reverse().map(bit => parseInt(bit));
    return bits.length >= length ? bits.slice(0, length) : [...bits, ...Array(length - bits.length).fill(0)];
}

export function ScreenToPNG(screen: Array<number>)
{
    const png = new PNG({
        width: 512,
        height: 256,
        filterType: -1
    });

    function PixelAt(row: number, column: number)
    {
        const cell = screen[row * 32 + Math.floor(column / 16)];
        const pixel = ToBitArray(cell, 16)[column % 16];
        return pixel;
    }

    for (let row = 0; row < png.height; ++row)
    {
        for (let column = 0; column < png.width; ++column)
        {
            const pixel = PixelAt(row, column);
            const color = pixel === 1 ? 0 : 255;

            // rgba
            const i = (png.width * row + column) * 4;
            png.data[i] = color;
            png.data[i + 1] = color;
            png.data[i + 2] = color;
            png.data[i + 3] = 255;
        }
    }

    return png;
}