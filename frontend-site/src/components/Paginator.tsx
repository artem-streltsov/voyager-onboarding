import React, { useRef, useState } from "react";
import { Box, Button, Flex, Input, Select } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

interface PaginatorProps {
  pageNumber: number;
  pageSize: number;
  onPageChange: (newPageNumber: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

const Paginator: React.FC<PaginatorProps> = ({ pageNumber, pageSize, onPageChange, onPageSizeChange }) => {
  const [inputValue, setInputValue] = useState<string>(pageNumber.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const baseURL = location.pathname;

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value);
    onPageSizeChange(newPageSize);
    setInputValue("1");
    navigate(`${baseURL}?ps=${newPageSize}&p=1`);
  };

  const handlePreviousPage = () => {
    const newPageNumber = pageNumber > 1 ? pageNumber - 1 : 1;
    onPageChange(newPageNumber);
    setInputValue(newPageNumber.toString());
    navigate(`${baseURL}?ps=${pageSize}&p=${newPageNumber}`);
  };

  const handleNextPage = () => {
    const newPageNumber = pageNumber + 1;
    onPageChange(newPageNumber);
    setInputValue(newPageNumber.toString());
    navigate(`${baseURL}?ps=${pageSize}&p=${newPageNumber}`);
  };

  const handleGotoPage = (value: string) => {
    const newPageNumber = parseInt(value);
    if (!isNaN(newPageNumber) && newPageNumber >= 1) {
      onPageChange(newPageNumber);
      setInputValue(newPageNumber.toString());
      navigate(`${baseURL}?ps=${pageSize}&p=${newPageNumber}`);
    }
  };

  const handleGoToButton = () => {
    if (inputRef.current) {
      handleGotoPage(inputRef.current.value);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputRef.current) {
      handleGotoPage(inputRef.current.value);
    }
  };

  return (
    <Flex direction="row" gap="1rem" mt="4" align="center">
      <Box>
        <Button onClick={handlePreviousPage} isDisabled={pageNumber === 1}>Previous</Button>
      </Box>
      <Box>
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          ref={inputRef}
          onKeyPress={handleKeyPress}
          width="60px"
          textAlign="center"
        />
      </Box>
      <Box>
        <Button onClick={handleGoToButton}>Go</Button>
      </Box>
      <Select value={pageSize} onChange={handlePageSizeChange}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="100">100</option>
      </Select>
      <Box>
        <Button onClick={handleNextPage}>Next</Button>
      </Box>
    </Flex>
  );
};

export default Paginator;
