async function loadPythonFile(filePath, pyodide) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    // console.log(fileName);
    const moduleName = fileName.substring(0, fileName.lastIndexOf("."));
    // console.log(moduleName);

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
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install("pydicom");

    const hello = await loadPythonFile("dicom/hello.py", pyodide);
    console.log("Test1 from JS");
    hello.helloWorld();
    console.log("Test2 from JS");
}
