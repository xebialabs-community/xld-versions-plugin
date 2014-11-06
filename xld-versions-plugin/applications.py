app_ids = repositoryService.query(Type.valueOf("udm.Application"), None, "Applications", None, None, None, 0, -1)

response.entity = [app_id.id[13:] for app_id in app_ids]
