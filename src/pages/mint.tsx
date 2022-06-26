import Layout from '@/Layouts/Main.layout';
import { Button, Link, Spinner, Text } from '@chakra-ui/react';
import {
    ChainId,
    useAddress,
    useEdition,
    useMetamask,
    useNetwork,
} from '@thirdweb-dev/react';
import axios from 'axios';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Mint: NextPage = () => {
    const address = useAddress();
    const connectMetamask = useMetamask();
    const [loading, setLoading] = useState(false);
    const edition = useEdition(process.env.NEXT_PUBLIC_EDITION_ADDRESS);
    const network = useNetwork();


    const handleClick = async () => {
        setLoading(true);
        try {
            const signedPayload = await axios.post('/api/mint-nft', {
                address,
            });

            if (signedPayload.data.signedPayload) {
                try {
                    const nft = await edition?.signature.mint(
                        signedPayload.data.signedPayload,
                    );
                    if (nft) {
                        await axios.post('/api/set-minted', {
                            address,
                        });
                    }
                    toast.success(
                        'Access Pass minted successfully! Head over to /surprise 👀',
                    );
                    return nft;
                } catch (err) {
                    toast.error(err.response.data.error);
                    return null;
                } finally {
                    setLoading(false);
                }
            }
        } catch (e) {
            toast.error(e.response.data.error);
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Link
                isExternal
                href={`https://testnets.opensea.io/assets/mumbai/${process.env.NEXT_PUBLIC_EDITION_ADDRESS}/0`}
            >
                <Image
                    src="/assets/access-pass.svg"
                    alt="Access Pass"
                    width={600}
                    height={300}
                    objectFit="contain"
                />
            </Link>
            <Text as="h2" fontSize="4xl" color="white" fontWeight="bold">
                Access Pass
            </Text>
            <Text as="h3" fontSize="xl" color="white">
                This access pass is a erc 1155 token that you can use to access
                a surprise page.
            </Text>
            {address ? (
                <Button
                    disabled={
                        loading || network[0].data.chain.id !== ChainId.Mumbai
                    }
                    mt="4"
                    cursor={
                        loading || network[0].data.chain.id !== ChainId.Mumbai
                            ? 'not-allowed'
                            : 'pointer'
                    }
                    onClick={handleClick}
                >
                    {loading ? (
                        <Spinner />
                    ) : network[0].data.chain.id !== ChainId.Mumbai ? (
                        'Switch to Mumbai'
                    ) : (
                        'Mint Access Pass'
                    )}
                </Button>
            ) : (
                <Button mt="4" onClick={() => connectMetamask()}>
                    <Image
                        src="/assets/metamask.svg"
                        alt="Metamask"
                        width={30}
                        height={30}
                    />
                    <Text fontSize="lg">Connect Metamask</Text>
                </Button>
            )}
        </Layout>
    );
};

export default Mint;
