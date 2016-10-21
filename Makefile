STATIC_DIR := src

# Concat files
concat_configs := $(shell find $(STATIC_DIR) -name '*.concat')
concat_files := $(concat_configs:%.concat=%)

objects := $(concat_files)

# clear out any suffixes
.SUFFIXES:

# Allow use of automatic variables in prerequisites
.SECONDEXPANSION:

# all is the default as long as it's first
all :  $(objects) $(concat_configs)
.PHONY : all clean



# Concat task
# The .concat files list the files that will be combined into the target file.
# For example: test.js is built from the files listed in test.js.concat.
% : %.concat
	@echo "Combining files listed in $< to $@";
	@rm -f $@;
	@cat $< | xargs cat >> $@;

# Touch .concat files to trigger rebuilding based on their prerequisites.
$(concat_configs) : %: $$(shell cat $$@)
	@touch $@;

# Automate marking all files that have been created to be ignored by git.
built_cache_index_files = $(filter $(shell git ls-files), $(sort $(objects)))

# Remove all built files except those that are tracked by git (built_cache_index_files).
clean :
	rm -rf $(sort $(filter-out $(built_cache_index_files),$(objects) ))
