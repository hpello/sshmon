test:
	@for SCENARIO in $(shell ls scenarios/) ; do \
		( \
			cd scenarios/$$SCENARIO && \
			docker-compose up -d --build && \
			docker-compose exec client npm test ; \
			STATUS=$$? ; docker-compose down -v && exit $$STATUS \
		) || exit 1 ; \
	done && echo 'All tests OK'
