Dat thu muc backup nay len may can restore, vi du: `D:\jobgo_backup_20260418_202832`

MongoDB:
```powershell
docker run --rm -v "D:\jobgo_backup_20260418_202832:/backup" mongo:7 mongorestore --host host.docker.internal --port 27017 --db jobgo --archive=/backup/jobgo_mongo.archive --gzip --drop
```

Elasticsearch:
```powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:9200/public_jobs_search
Invoke-RestMethod -Method Put -Uri http://localhost:9200/public_jobs_search -ContentType "application/json" -InFile "D:\jobgo_backup_20260418_202832\elasticsearch_public_jobs_search.create-index.json"
curl.exe -X POST "http://localhost:9200/_bulk" -H "Content-Type: application/x-ndjson" --data-binary "@D:\jobgo_backup_20260418_202832\elasticsearch_public_jobs_search.data.ndjson"
```

Neu index chua ton tai, bo qua dong `Delete`.
