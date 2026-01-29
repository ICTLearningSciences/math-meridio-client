/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useNavigate } from 'react-router-dom';

export function useNavigateWithParams() {
  const navigate = useNavigate();
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const searchParams = new URLSearchParams(search);

  const navigateWithParams = (path: string, options = {}) => {
    // Build the new URL with all existing parameters
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const url = new URL(path, origin);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Navigate to the new URL
    navigate(`${url.pathname}${url.search}`, options);
  };

  return navigateWithParams;
}
