import { loadPyodide, PyodideInterface } from "pyodide";
const fetch = require("node-fetch");

async function loadPythonFile(filePath: string) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    const moduleName = fileName.substring(0, fileName.lastIndexOf("."));

    //TODO: Pyodide is loaded multiple times. Is this necessary?
    let pyodide = await loadPyodide();
    let response = await fetch("http://localhost:8000/" + filePath);
    let buffer = await response.text();
    pyodide.FS.writeFile(fileName, buffer);
    // const readFile = pyodide.FS.readFile(fileName, {
    //     encoding: "utf8",
    // });
    return pyodide.pyimport(moduleName);
}

async function main() {
    const hello = await loadPythonFile("dicom/hello.py");
    const benchmark = await loadPythonFile("dicom/benchmark.py");
    hello.helloWorld();
    benchmark.execute(100000);
}

main();
