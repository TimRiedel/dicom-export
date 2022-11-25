import { loadPyodide } from "pyodide";
const fetch = require("node-fetch");

async function loadPythonFile(filePath: string) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    console.log(fileName);
    const moduleName = fileName.substring(0, fileName.lastIndexOf("."));
    console.log(moduleName);

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
    let pyodide = await loadPyodide();
    await pyodide.loadPackage(["micropip", "numpy"]);
    const micropip = pyodide.pyimport("micropip");
    await micropip.install("pydicom");
    const overlay = await loadPythonFile("dicom/overlay.py");
    overlay.add();
}
