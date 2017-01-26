#
# THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS
# FOR A PARTICULAR PURPOSE. THIS CODE AND INFORMATION ARE NOT SUPPORTED BY XEBIALABS.
#

env_orders = repositoryService.query(Type.valueOf("versions.EnvironmentOrder"), None, "Configuration", None, None, None, 0, -1)

order = []

if env_orders:
	if len(env_orders) > 1:
		logger.warn("More than one EnvironmentOrder found, using the first: %s" % (env_orders[0].id) )

	env_order_id = env_orders[0].id
	env_order = repositoryService.read(env_order_id)

	order = env_order.order

response.entity = order
