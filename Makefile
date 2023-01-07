gen-migration:
	yarn typeorm migration:generate -p -n $(name) -d src/migrations
run-migration:
	yarn typeorm migration:run
revert-migration:
	yarn typeorm migration:revert