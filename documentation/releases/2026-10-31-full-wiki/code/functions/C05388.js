(u8){let i=0;total+=u8.length;
      if(bl){while(bl<64&&i<u8.length)buf[bl++]=u8[i++];if(bl===64){block(buf,0);bl=0}}
      for(;i+64<=u8.length;i+=64)block(u8,i);
      while(i<u8.length)buf[bl++]=u8[i++];}