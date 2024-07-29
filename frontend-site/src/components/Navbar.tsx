import { Flex, Text, Image, Box } from "@chakra-ui/react";
import CustomLink from './CustomLink';

const Navbar = () => {
  return (
    <Flex
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      padding="1rem"
      width="100vw"
      position="relative"
      backgroundColor="#DDDDDD"
      marginBottom="1rem"
    >
      <Box position="absolute" left="1rem">
        <CustomLink to={"/"}>
          <Image src="/logo.svg" alt="Logo" height="2rem" />
        </CustomLink>
      </Box>
      <Flex flex="1" justifyContent="center" gap="2rem">
        <CustomLink to={"/blocks"}>
          <Text>Blocks</Text>
        </CustomLink>
        <CustomLink to={"/transactions"}>
          <Text>Transactions</Text>
        </CustomLink>
      </Flex>
    </Flex>
  );
};

export default Navbar;
