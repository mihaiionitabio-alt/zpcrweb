x=>({entry:x.name,bytes:x.usize,compressed:x.csize,zip_date:x.date,
      crc32:x.crc.toString(16).padStart(8,"0"),crc_valid:x.dir?"":(x.crcOk?"yes":"NO")})