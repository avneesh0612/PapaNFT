import type { NextApiRequest, NextApiResponse } from 'next';
import { table } from '../../utils/Airtable';

const generateMintSignature = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    const { address } = req.body;

    const record = await table
        .select({
            fields: ['address', 'minted'],
            filterByFormula: `NOT({address} != '${address}')`,
        })
        .all();

    try {
        record[0].updateFields({
            minted: 'true',
        });
        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        return res.status(500).json({
            error: err,
        });
    }
};

export default generateMintSignature;
