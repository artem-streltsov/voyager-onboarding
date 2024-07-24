import React from 'react';
import { Link, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Text } from "@chakra-ui/react";

interface CustomLinkProps extends RouterLinkProps {
  children: React.ReactNode;
}

const CustomLink: React.FC<CustomLinkProps> = ({ children, ...props }) => {
  return (
    <Link {...props}>
      <Text as="span" color="blue.500" _hover={{ textDecoration: 'underline' }}>
        {children}
      </Text>
    </Link>
  );
}

export default CustomLink;
