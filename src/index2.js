async function loadPythonFile(filePath) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    // console.log(fileName);
    const moduleName = fileName.substring(0, fileName.lastIndexOf("."));
    // console.log(moduleName);

    //TODO: Pyodide is loaded multiple times. Is this necessary?
}

async function main() {
    let pyodide = await loadPyodide();
    await pyodide.loadPackage("numpy");
    await pyodide.runPythonAsync(`
      from pyodide.http import pyfetch
      response = await pyfetch("http://localhost:8000/dicom/hello.py")
      with open("hello.py", "wb") as f:
          f.write(await response.bytes())
    `);
    hello = pyodide.pyimport("hello");

    // const micropip = pyodide.pyimport("micropip");
    // await micropip.install("pydicom");
    console.log("Test1 from JS");
    hello.helloWorld();
    console.log("Test2 from JS");
}
