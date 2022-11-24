import { loadPyodide } from "pyodide";

async function main() {
    let pyodide = await loadPyodide();
    console.log(
        pyodide.runPython(`
          import sys
          sys.version`)
    );
    pyodide.runPython("print('Hello World from Python')");
}

main();
