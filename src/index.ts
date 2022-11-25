import { loadPyodide } from "pyodide";
const fetch = require("node-fetch");

async function load() {
    let pyodide = await loadPyodide();
    let response = await fetch("http://localhost:8000/dicom/benchmark.py");
    let buffer = await response.text();
    pyodide.FS.writeFile("benchmark.py", buffer);
    // const readFile = pyodide.FS.readFile("benchmark.py", {
    //     encoding: "utf8",
    // });
    return pyodide.pyimport("benchmark");
}

async function main() {
    const benchmark = await load();
    console.log("Import successful");
    benchmark.execute();
}

main();
