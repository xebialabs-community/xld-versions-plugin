env_orders = repositoryService.query(Type.valueOf("versions.EnvironmentOrder"), None, "Configuration", None, None, None, 0, -1)

order = []

if env_orders:
	if len(env_orders) > 1:
		logger.warn("More than one EnvironmentOrder found, using the first: %s" % (env_orders[0].id) )

	env_order_id = env_orders[0].id
	env_order = repositoryService.read(env_order_id)

	order = env_order.order

response.entity = order
