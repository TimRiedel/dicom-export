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
    overlay.write_dicom_overlay("testFile.dcm");
    downloadDicom(pyodide);
}

async function loadPythonFile(filePath, pyodide) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    const moduleName = fileName.substring(0, fileName.lastIndexOf("."));

    let response = await fetch("http://localhost:8000/" + filePath);
    let buffer = await response.text();
    pyodide.FS.writeFile(fileName, buffer);

    return pyodide.pyimport(moduleName);
}

async function readDicom(pyodide) {
    let response = await fetch("http://localhost:8000/data/testFile.dcm");
    let buffer = await response.arrayBuffer();
    let view = new Uint8Array(buffer);
    pyodide.FS.writeFile("testFile.dcm", view, { encoding: "binary" });
}

function downloadDicom(pyodide) {
    let file = pyodide.FS.readFile("testFile-out.dcm", { encoding: "binary" });
    const blob = new Blob([file], { type: "application/dicom" });
    let url = window.URL.createObjectURL(blob);
    window.location.assign(url);
}
