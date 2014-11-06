env = request.query["env"]
application = request.query["application"]

deployed_app_id = "%s/%s" % (env, application.split('/')[-1])
deployed_app = repositoryService.read(deployed_app_id)

env_details = {}
env_details["env"] = env
env_details["version"] = deployed_app.version.id
env_details["containers"] = list(set([deployed.id.split('/')[-2] for deployed in deployed_app.deployeds]))

response.entity = env_details
