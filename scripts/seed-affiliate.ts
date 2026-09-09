import 'dotenv/config'

import config from '@payload-config'
import { seed } from '@/endpoints/seed'
import { createLocalReq, getPayload } from 'payload'

const payload = await getPayload({ config })
const req = await createLocalReq({}, payload)

await seed({ payload, req })
await payload.destroy()
process.exit(0)
