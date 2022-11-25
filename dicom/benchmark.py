import datetime

def execute():
  print("Starting benchmark...")
  startTime = datetime.datetime.now()
  myVar = 10
  for i in range(0, 100000, 1):
    myVar *= 10000000
  endTime = datetime.datetime.now()
  print("Benchmark completed in: " + str(endTime - startTime))