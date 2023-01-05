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

    const overlay = await loadPythonFile(
        "dicom_read_write/overlay-pydicom.py",
        pyodide
    );

    await readDicom(pyodide);

    overlay.write_dicom_overlay("0.dcm");

    downloadDicom(pyodide);
}

async function readDicom(pyodide) {
    let response = await fetch("http://localhost:8000/data/0.dcm");
    let buffer = await response.arrayBuffer();
    let view = new Uint8Array(buffer);
    pyodide.FS.writeFile("0.dcm", view, { encoding: "binary" });
    // console.log("Response: " + response);
    // console.log("Buffer view: " + view);
}

function downloadDicom(pyodide) {
    let file = pyodide.FS.readFile("0-out.dcm", { encoding: "binary" });
    const blob = new Blob([file], { type: "application/dicom" });
    let url = window.URL.createObjectURL(blob);
    window.location.assign(url);
}
