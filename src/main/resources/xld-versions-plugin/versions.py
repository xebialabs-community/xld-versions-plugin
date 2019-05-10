#
# Copyright 2019 XEBIALABS
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
