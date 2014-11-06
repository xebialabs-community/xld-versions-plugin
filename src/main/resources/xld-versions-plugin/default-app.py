default_apps = repositoryService.query(Type.valueOf("versions.DefaultApplication"), None, "Configuration", None, None, None, 0, -1)

app = ""

if default_apps:
    if len(default_apps) > 1:
        logger.warn("More than one DefaultApplication found, using the first: %s" % (default_apps[0].id) )

    default_app_id = default_apps[0].id
    default_app = repositoryService.read(default_app_id)

    app = default_app.app.id[13:]

response.entity = app
