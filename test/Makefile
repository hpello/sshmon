test:
	@for SCENARIO in $(shell ls scenarios/) ; do \
		( \
			cd scenarios/$$SCENARIO && \
			docker-compose up -d --build && \
			docker-compose exec client yarn test ; \
			STATUS=$$? ; docker-compose down -v && exit $$STATUS \
		) || exit 1 ; \
	done && echo 'All tests OK'
