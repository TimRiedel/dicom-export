async function loadPythonFile(filePath) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    // console.log(fileName);
    const moduleName = fileName.substring(0, fileName.lastIndexOf("."));
    // console.log(moduleName);

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
    await pyodide.loadPackage("numpy");
    // const micropip = pyodide.pyimport("micropip");
    // await micropip.install("pydicom");
    // pyodide.runPython(`
    //     import numpy
    //     print(numpy.zeros(5))
    //     `);

    const overlay = await loadPythonFile("dicom/hello.py");
    console.log("Test1 from JS");
    overlay.helloWorld();
    console.log("Test2 from JS");
}
