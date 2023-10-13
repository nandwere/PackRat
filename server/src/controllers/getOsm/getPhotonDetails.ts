import {
  InvalidRequestParamsError,
  RetrievingPhotonDetailsError,
} from '../../helpers/errors';
import { responseHandler } from '../../helpers/responseHandler';
import { z } from 'zod';
import { publicProcedure } from '../../trpc';
import { getPhotonDetailsService } from '../../services/osm/getPhotonDetailsService';

/**
 * Retrieves Photon details based on the provided ID and type.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} The function does not return anything.
 */
export const getPhotonDetails = async (c, next) => {
  const { id, type } = c.req.param();
  if (!id || !type) {
    next(InvalidRequestParamsError);
  }
  try {
    const result = await getPhotonDetailsService(id, type);
    res.locals.data = result;
    responseHandler(c);
  } catch (error) {
    next(RetrievingPhotonDetailsError);
  }
};

export function getPhotonDetailsRoute() {
  return publicProcedure
    .input(
      z.object({ id: z.union([z.string(), z.number()]), type: z.string() }),
    )
    .query(async (opts) => {
      const { id, type } = opts.input;
      return await getPhotonDetailsService(id, type);
    });
}
