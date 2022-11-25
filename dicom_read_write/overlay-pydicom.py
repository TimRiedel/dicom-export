from pathlib import Path
import numpy
import matplotlib.pyplot as plt
from pydicom import dcmread
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


def generate_overlay_mask(rows, cols):
  x = numpy.repeat(0, cols)
  y = numpy.repeat(1, cols)
  arr1 = numpy.repeat(x, rows/2)
  arr2 = numpy.repeat(y, rows/2)
  return numpy.append(arr1, arr2)


def add_overlay(ds, overlay_mask):
  print(overlay_mask.shape)
  packed_mask = pack_bits(overlay_mask)
  vr = determine_overlay_vr(ds)

  ds.add_new(0x60000010, 'US', image_data.shape[0])   # Overlay Plane Rows
  ds.add_new(0x60000011, 'US', image_data.shape[0])   # Overlay Plane Columns
  ds.add_new(0x60000040, 'CS', "R")                   # Overlay Type
  ds.add_new(0x60000045, 'LO', "AUTOMATED")           # Overlay Subtype
  ds.add_new(0x60000050, 'SS', [1, 1])                # Overlay Origin
  ds.add_new(0x60000100, 'US', 1)                     # Overlay Bits Allocated
  ds.add_new(0x60000102, 'US', 0)                     # Overlay Bit Position
  ds.add_new(0x60003000,  vr , packed_mask)           # Overlay Data


base_dir = Path("./data")
ds = dcmread(base_dir/"0.dcm")
image_data = ds.pixel_array

mask = generate_overlay_mask(image_data.shape[0], image_data.shape[1])
add_overlay(ds, mask)

ds.save_as(base_dir/'out'/'0-out.dcm')
