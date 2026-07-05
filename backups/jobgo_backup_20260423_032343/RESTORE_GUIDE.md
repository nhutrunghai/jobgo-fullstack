Dat thu muc backup nay len may can restore, vi du: D:\jobgo_backup_20260423_032343

MongoDB:
`powershell
docker run --rm -v "D:\jobgo_backup_20260423_032343:/backup" mongo:7 mongorestore --host host.docker.internal --port 27017 --db jobgo --archive=/backup/jobgo_mongo.archive --gzip --drop
`

Elasticsearch:
candidate_resumes_chunks
`powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:9200/candidate_resumes_chunks
Invoke-RestMethod -Method Put -Uri http://localhost:9200/candidate_resumes_chunks -ContentType "application/json" -InFile "D:\jobgo_backup_20260423_032343\elasticsearch_candidate_resumes_chunks.create-index.json"
curl.exe -X POST "http://localhost:9200/_bulk" -H "Content-Type: application/x-ndjson" --data-binary "@D:\jobgo_backup_20260423_032343\elasticsearch_candidate_resumes_chunks.data.ndjson"
`

public_jobs_search
`powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:9200/public_jobs_search
Invoke-RestMethod -Method Put -Uri http://localhost:9200/public_jobs_search -ContentType "application/json" -InFile "D:\jobgo_backup_20260423_032343\elasticsearch_public_jobs_search.create-index.json"
curl.exe -X POST "http://localhost:9200/_bulk" -H "Content-Type: application/x-ndjson" --data-binary "@D:\jobgo_backup_20260423_032343\elasticsearch_public_jobs_search.data.ndjson"
`

Neu index chua ton tai, bo qua dong Delete.
