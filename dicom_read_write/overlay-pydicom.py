from pathlib import Path
import numpy
import pydicom
from pydicom.pixel_data_handlers.numpy_handler import pack_bits


def determine_overlay_vr(ds):
  transfer_syntax = ds.file_meta.TransferSyntaxUID

  if transfer_syntax == "1.2.840.10008.1.2":      # Implicit VR Little Endian
    overlay_vr = "OW"
  elif transfer_syntax == "1.2.840.10008.1.2.1":  # Explicit VR Little Endian
    overlay_vr = "OW"
  else:
    raise NotImplemented
  return overlay_vr


def generate_chess_overlay(rows, cols):
  arr = numpy.zeros((rows, cols))
  for i in range(0, rows):
    for j in range(0, cols):
      if (i > rows/2 or j > cols/2) and not (i > rows/2 and j > cols/2):
        arr[i, j] = 1
      
  return arr


def add_overlay(ds, overlay_mask):
  packed_mask = pack_bits(overlay_mask)
  vr = determine_overlay_vr(ds)

  ds.add_new(0x60000010, 'US', ds.pixel_array.shape[0])   # Overlay Plane Rows
  ds.add_new(0x60000011, 'US', ds.pixel_array.shape[0])   # Overlay Plane Columns
  ds.add_new(0x60000040, 'CS', "R")                       # Overlay Type
  ds.add_new(0x60000045, 'LO', "AUTOMATED")               # Overlay Subtype
  ds.add_new(0x60000050, 'SS', [1, 1])                    # Overlay Origin
  ds.add_new(0x60000100, 'US', 1)                         # Overlay Bits Allocated
  ds.add_new(0x60000102, 'US', 0)                         # Overlay Bit Position
  ds.add_new(0x60003000,  vr , packed_mask)               # Overlay Data


def write_dicom_overlay(filePath):
  ds = pydicom.dcmread(filePath)

  mask = generate_chess_overlay(ds.pixel_array.shape[0], ds.pixel_array.shape[1])
  add_overlay(ds, mask)

  ds.save_as('testFile-out.dcm')