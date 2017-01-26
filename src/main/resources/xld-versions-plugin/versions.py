#
# THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS
# FOR A PARTICULAR PURPOSE. THIS CODE AND INFORMATION ARE NOT SUPPORTED BY XEBIALABS.
#

application = request.query["application"]

versions = {}
if application:
    app_name = application.split('/')[-1]

    # Retrieve a list of deployed applications
    deployed_app_ids = repositoryService.query(Type.valueOf("udm.DeployedApplication"), None, "Environments/", app_name, None, None, 0, -1)
    for deployed_app_id in deployed_app_ids:
        # Retrieve actual deployed application
        deployed_app = repositoryService.read(deployed_app_id.id)

        # Check if we have the correct application.
        # We need to do this, because the ID of the deployed application ONLY
        # uses the last part of the name... If we would have two application with 
        # the same name in different folders, they would otherwise both show up here.
        # To work around this we can use the ID of the referenced version ID.
        if deployed_app.version.id.startswith("Applications/%s" % application):
            env = deployed_app.id.rsplit('/', 1)[0]
            version = deployed_app.version.id

            if version in versions:
                (versions[version]["envs"]).append(env)
            else:
                package = repositoryService.read(deployed_app.version.id)
                versions[version] = {
                    "envs": [env],
                    "package": package,
                    "isCollapsed": True
                }

response.entity = versions
