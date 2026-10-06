# MiseZero demo script

The app keeps data in this browser. Start at a fresh sample from Settings → Reset demo data.

1. Open Stock Estimates. Fresh cream should read about 4.5 L most probable (12 L delivered − 7 L recipe use − 0.5 L waste). The range is wider because nothing has been counted yet.
2. On Smart Intake, upload a CSV invoice such as:

```
supplier,date,product,qty,unit,cost,batch,useBy
Northvale Dairy,2026-10-05,Fresh cream,2,L,3.20,NV-9,2026-10-08
```

The row appears as a draft. Stock does not move yet.
3. Press Confirm on that draft. Return to Stock Estimates. Cream’s most probable figure rises by 2 L.
4. Still on Smart Intake, paste a sales file and press Preview, then Confirm import:

```
date,item,qty
2026-10-05,Cake slice,10
not-a-date,Cake slice,2
```

The bad row is listed and skipped. The valid row lowers cream (each slice uses 100 ml).
5. Open the Daily Action Hub. Cream is ranked from value at risk and how close the action deadline is. Accept the top option.
6. Press Mark done and save a quantity saved, a quantity wasted, and a value.
7. Open Waste & Evidence. The completed action is inside the date range, value protected includes the amount you entered, and Download CSV / Printable view export that pack.
8. Open Activity. Each of those saves is listed.
