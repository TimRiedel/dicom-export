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
        "dicom_read_write/overlay_pydicom.py",
        pyodide
    );

    console.log("starting benchmark");

    const files_count = 31;
    const runs = 5;
    var downloadUrl;
    var startTime = performance.now();

    for (let run = 0; run < runs; run++) {
        for (let index = 0; index < files_count; index++) {
            dicom_dir = "http://localhost:8000/data/benchmark/";
            await readDicom(pyodide, dicom_dir, index + ".dcm");
            overlay.write_dicom_overlay(
                index + ".dcm",
                index + "-out.dcm",
                overlay_shape=3
            );
            downloadUrl = downloadDicom(pyodide, index + "-out.dcm");
        }
    }
    var endTime = performance.now();

    console.log("benchmark took", endTime - startTime, "ms");
    // window.location.assign(downloadUrl);

    // await readDicom(pyodide);
    // overlay.write_dicom_overlay("0.dcm", "0-out.dcm", overlay_shape=3);

}

async function readDicom(pyodide, dicom_dir, dicom_file) {
    // loop to fetch 30 dicom files from localhost
    let response = await fetch(dicom_dir + dicom_file);
    let buffer = await response.arrayBuffer();
    let view = new Uint8Array(buffer);


    pyodide.FS.writeFile(dicom_file, view, { encoding: "binary" });

    // console.log("Buffer view: " + view);
}

function downloadDicom(pyodide, dicom_file) {
    let file = pyodide.FS.readFile(dicom_file, { encoding: "binary" });
    const blob = new Blob([file], { type: "application/dicom" });
    let url = window.URL.createObjectURL(blob);
    return url
    // window.location.assign(url);
}
