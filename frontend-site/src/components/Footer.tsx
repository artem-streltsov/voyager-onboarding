import { Flex, Text } from "@chakra-ui/react";
import CustomLink from './CustomLink';

const Footer = () => {
  return (
    <Flex
      direction="row"
      gap={"1rem"}
      alignItems={"start"}
      justifyContent={"space-around"}
      padding={"2rem"}
      width="100vw"
      backgroundColor="#DDDDDD"
      marginTop="1rem"
    >
      <Flex direction="column" alignItems="start" gap="0.25rem">
        <Text fontSize="sm" mb="0.5rem">Starknet resources</Text>
        <CustomLink to={"https://www.starknet-ecosystem.com/"}>
        <Text fontSize="smaller">Ecosystem</Text>
        </CustomLink>
        <CustomLink to={"https://docs.starknet.io/documentation/architecture_and_concepts/Network_Architecture/starknet_architecture_overview/"}>
        <Text fontSize="sm">Architecture</Text>
        </CustomLink>
        <CustomLink to={"https://book.starknet.io/"}>
        <Text fontSize="sm">Book</Text>
        </CustomLink>
        <CustomLink to={"https://github.com/starkware-libs/starknet-specs/blob/master/api/starknet_api_openrpc.json"}>
        <Text fontSize="sm">RPC spec</Text>
        </CustomLink>
        <CustomLink to={"https://community.starknet.io/"}>
        <Text fontSize="sm">Community forum</Text>
        </CustomLink>
      </Flex>
      <Flex direction="column" alignItems="start" gap="0.25rem">
        <Text fontSize="sm" mb="0.5rem">Cairo resources</Text>
        <CustomLink to={"https://book.cairo-lang.org/"}>
        <Text fontSize="sm">Book</Text>
        </CustomLink>
        <CustomLink to={"https://starklings.app/"}>
        <Text fontSize="sm">Starklings web app</Text>
        </CustomLink>
        <CustomLink to={"https://github.com/shramee/starklings-cairo1"}>
        <Text fontSize="sm">Starklings CLI tool</Text>
        </CustomLink>
        <CustomLink to={"https://starknet-by-example.voyager.online/"}>
        <Text fontSize="sm">Starknet by example</Text>
        </CustomLink>
        <CustomLink to={"https://remix.ethereum.org/#activate=Starknet"}>
        <Text fontSize="sm">Starknet remix plugin</Text>
        </CustomLink>
      </Flex>
    </Flex>
  );
}

export default Footer;
