function pdfUnicodeObjects(){if(PDF_UNICODE_OBJECTS)return PDF_UNICODE_OBJECTS;const f=MISSY_PDF_FONT,font=pdfFontBytes(f.compressedFont),map=pdfFontBytes(f.compressedMap),cmap=new TextEncoder().encode('/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /MISSY-Unicode def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n1 beginbfrange\n<0000> <FFFF> <0000>\nendbfrange\nendcmap\nCMapName currentdict /CMap defineresource pop\nend end');
return PDF_UNICODE_OBJECTS=[
'<< /Type /Font /Subtype /Type0 /BaseFont /MISSYPDFSans /Encoding /Identity-H /DescendantFonts [6 0 R] /ToUnicode 10 0 R >>',
'<< /Type /Font /Subtype /CIDFontType2 /BaseFont /MISSYPDFSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor 7 0 R /DW 1000 /W [0 ['+f.widths.join(' ')+']] /CIDToGIDMap 9 0 R >>',
'<< /Type /FontDescriptor /FontName /MISSYPDFSans /Flags 4 /FontBBox [-1000 -1100 3000 2000] /ItalicAngle 0 /Ascent '+f.ascent+' /Descent '+f.descent+' /CapHeight 733 /StemV 80 /FontFile2 8 0 R >>',
{dict:'<< /Length '+font.length+' /Length1 '+f.fontBytes+' /Filter /FlateDecode >>',stream:font},
{dict:'<< /Length '+map.length+' /Filter /FlateDecode >>',stream:map},
{dict:'<< /Length '+cmap.length+' >>',stream:cmap}];}