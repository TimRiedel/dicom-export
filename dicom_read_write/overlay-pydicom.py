from pathlib import Path
import numpy
import pydicom
# from pydicom import dcmread
from pydicom.pixel_data_handlers.numpy_handler import pack_bits


def determine_overlay_vr(ds):
  transfer_syntax = ds.file_meta.TransferSyntaxUID

  if transfer_syntax == "1.2.840.10008.1.2": # Implicit VR Little Endian
    overlay_vr = "OW"
  elif transfer_syntax == "1.2.840.10008.1.2.1": # Explicit VR Little Endian
    overlay_vr = "OW"
  else:
    raise NotImplemented
  return overlay_vr


def generate_chess_overlay_mask(rows, cols):
  arr = numpy.zeros((rows, cols))
  for i in range(0, rows):
    for j in range(0, cols):
      if (i > rows/2 or j > cols/2) and not (i > rows/2 and j > cols/2):
        arr[i, j] = 1
      
  return arr

def generate_chess2_overlay_mask(rows, cols):
  arr = numpy.ones((rows, cols))
  for i in range(0, rows):
    for j in range(0, cols):
      if (i > rows/2 or j > cols/2) and not (i > rows/2 and j > cols/2):
        arr[i, j] = 0
      
  return arr


def add_overlay(ds, overlay_mask):
  packed_mask = pack_bits(overlay_mask)
  vr = determine_overlay_vr(ds)

  ds.add_new(0x60000010, 'US', ds.pixel_array.shape[0])   # Overlay Plane Rows
  ds.add_new(0x60000011, 'US', ds.pixel_array.shape[0])   # Overlay Plane Columns
  ds.add_new(0x60000040, 'CS', "R")                   # Overlay Type
  ds.add_new(0x60000045, 'LO', "AUTOMATED")           # Overlay Subtype
  ds.add_new(0x60000050, 'SS', [1, 1])                # Overlay Origin
  ds.add_new(0x60000100, 'US', 1)                     # Overlay Bits Allocated
  ds.add_new(0x60000102, 'US', 0)                     # Overlay Bit Position
  ds.add_new(0x60003000,  vr , packed_mask)           # Overlay Data


def write_dicom_overlay(filePath):
  # print("File Path from Python: " + filePath)
  # with open("0.dcm", "r") as fh:
  #       data = fh.read()
  # print("Data from Python: " + data)

  ds = pydicom.dcmread(filePath)
  # print(ds)
  # print(ds.StudyDate)
  image_data = ds.pixel_array

  mask = generate_chess2_overlay_mask(image_data.shape[0], image_data.shape[1])
  add_overlay(ds, mask)

  ds.save_as('0-out.dcm')

def old_main():
  base_dir = Path("./data")
  ds = pydicom.dcmread(base_dir/"0.dcm")
  image_data = ds.pixel_array

  mask = generate_overlay_mask(image_data.shape[0], image_data.shape[1])
  add_overlay(ds, mask)

  ds.save_as(base_dir/'out'/'0-out.dcm')