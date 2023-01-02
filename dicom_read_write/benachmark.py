from pathlib import Path
import overlay_pydicom
import time

def main(data_src="data/benchmark", out="data/annotated", runs=5):
    # find all dicom files in the data directory

    dicom_files = list(Path(data_src).glob("*.dcm"))
    t1 = time.time()
    for i in range(runs):
        for dicom_file in dicom_files:
            annotation_file = Path(out)/(f"a{i}_{dicom_file.name}")
            overlay_pydicom.write_dicom_overlay(dicom_file, annotation_file, overlay_shape=3)
    
    t2 = time.time()
    print(f"Annotated {len(dicom_files) * runs} files.")
    print(f"Time: {(t2 - t1):.2f} seconds")


def rename_files(data_src="data/case1", out="data/benchmark"):
    dicom_files = list(Path(data_src).glob("*.dcm"))
    for i, dicom_file in enumerate(dicom_files):
        new_file = Path(out)/(f"{i}.dcm")
        dicom_file.rename(new_file)


if __name__ == "__main__":
    main()