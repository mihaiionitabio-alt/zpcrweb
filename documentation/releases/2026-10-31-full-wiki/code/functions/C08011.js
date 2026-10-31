r=>Object.values(r.plate||{}).flatMap(rec=>
      Object.values(rec.channels||{}).map(ch=>ch.targetName))