Vagrant.configure("2") do |config|
  config.vm.synced_folder '.', '/vagrant', disabled: true

  config.vm.define "centos-7" do |centos7|
    centos7.vm.box = 'elastic/centos-7-x86_64'
  end

  config.vm.define "centos-8" do |centos8|
    centos8.vm.box = 'elastic/centos-8-x86_64'
  end

  config.vm.define "debian-8" do |debian8|
    debian8.vm.box = 'elastic/debian-8-x86_64'
  end

  config.vm.define "debian-9" do |debian9|
    debian9.vm.box = 'elastic/debian-9-x86_64'
  end

  config.vm.define "oraclelinux-7" do |oraclelinux7|
    oraclelinux7.vm.box = 'elastic/oraclelinux-7-x86_64'
  end

  config.vm.define "oraclelinux-8" do |oraclelinux8|
    oraclelinux8.vm.box = 'elastic/oraclelinux-8-x86_64'
  end

  config.vm.define "rhel-8" do |rhel8|
    rhel8.vm.box = 'elastic/rhel-8-x86_64'
  end
end