# DICOM Export
### Problem
This repository is a spike for the DICOM Export feature in the medical image editor [Visian](https://visian.org/).
The problem was, that there are currently no Javascript libraries available that allow you to modify DICOM files (medical image data). This was needed in order to attach annotations generated by Visian to existing DICOM files. For this we wanted to add the overlay module (DICOM attributes) to the file, instead of storing the annotations separately.

Although there are no JS libraries available, there is a library for Python called [Pydicom](https://github.com/pydicom/pydicom) that allows you to modify all kind of DICOM attributes. This package can be used in Javascript with the library [Pyodide](https://pyodide.org/en/stable/), which enables us to execute python scripts with pure-python packages from JS through WebAssembly.

### How to setup
1. Create a virtual envioronment with `python3 -m venv .venv`
2. Activate the virtual environment `source .venv/bin/activate`
1. Run `python -m http.server` in active environment
2. Go to `https://localhost:8000/src/index.html`
3. Hitting *Run* will load the file `data/testFile.dcm`, add the overlay and save it to your downloads.

### Operation
The most important files are `dicom_read_write/overlay-dicom.py` and `src/index.js` as well as the Jupyter Notebook for testing `dicom_read_write/rw_pydicom.ipynb`.

After loading pyodide, one can install **pure-python** packages with micropip as follows:
```
let pyodide = await loadPyodide();
await pyodide.loadPackage("numpy");
await pyodide.loadPackage("micropip");
const micropip = pyodide.pyimport("micropip");
await micropip.install("pydicom");
```
Own python scripts can be imported by adding the imported python file to the virtual file system of WebAssembly (Emscripten). Then functions from the script can be called from within Javascript:
```
pyodide.FS.writeFile(fileName, buffer);
overlay = pyodide.pyimport("overlay");
overlay.write_dicom_overlay("testFile.dcm");
```
In order to use the DICOM file from within the python module, the file must be stored in the virtual file system as a `Uint8Array`. See `readDicom` and `writeDicom` methods for reference.

Adding the overlay from pydicom is relatively easy, just specify the DICOM tag like so:
```
ds.add_new(0x60000010, 'US', ds.pixel_array.shape[0])   # Overlay Plane Rows
```
For more information on DICOM tags have a look at the [DICOM Browser](https://dicom.innolitics.com/ciods) and its MR Image > Overlay Plane.
The data can be saved to the virtual file system, by calling `ds.save_as()`.

### Benchmark
We asked ourselves, how much pyodide slows down the process of adding overlay modules to a DICOM file compared to pure pydicom. Therefore we executed a benchmark test with a DICOM Series of 30 layers each having 500KB. We did 5 cycles, where we added a random annotation to each layer (total 500 files, 75MB). The results were as follows:
- Pydicom (pure Python): **33,61 s**
- Pydicom (from JS with Pyodide, Firefox Browser): **138,88 s**
- Pydicom (from JS with Pyodide, Edge Browser): **181,62 s**

Our conclusion is, that for exporting single images from an editor like Visian, pydicom and pyodide can be a valid solution. However for bigger datasets the waiting times become too long and a native solution should be preferred.

### Links
- [Pydicom GitHub](https://github.com/pydicom/pydicom)
- [Pydicom Documenation](https://pydicom.github.io/pydicom/stable/)
- [Pyodide](https://pyodide.org/en/stable/)
- [DICOM Standard Browser](https://dicom.innolitics.com/ciods)
