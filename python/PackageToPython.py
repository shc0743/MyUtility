# Python Package Utility
import os, sys, subprocess as sp, gc, ctypes

def main():
    space32 = ' ' * 32
    try:
        Fin = input("Input File: ")
        Fout = input("Output File: ")
        Fvar = input("Python function name: ")
    except:
        print("Error during open file!!")
        return 1
    print("Checking output file...", end="\r")
    if not os.path.exists(Fout):
        print("Creating output file...", end="\r")
        Fout_ = open(Fout, 'w')
        Fout_.write("import os, subprocess\n\n")
        Fout_.close()
        Fout_ = None
        gc.collect()
    print("Converting certutil..." + space32, end="\r")
    sp.call("certutil -encode \""+Fin+"\" CERTUT_1.tmp",
        shell=False, stdin=sp.PIPE, stdout=sp.PIPE, stderr=sp.PIPE)
    try:
        Fin = open('CERTUT_1.tmp','r')
    except:
        print("Error: Cannot open certutil file!")
        gc.collect()
        sp.call("pause", shell=True)
        print('')
        pass
    Fout = open(Fout, 'a')
    Fout.write("def "+Fvar+"():\n    _ = open('CERTUTIL.tmp','w')\n    _.write('''\n")
    print("Reading input file..." + space32, end="\r")
    Fout.write(Fin.read())
    Fin.close()
    Fin = None
    gc.collect()
    print("Deleting temp file..." + space32, end="\r")
    os.remove("CERTUT_1.tmp")
    print("Writing output file..." + space32, end="\r")
    Fout.write("\n''')\n    _.close()\n    subprocess.call('cmd.exe /C certutil -decode")
    Fout.write(" CERTUTIL.tmp ._TempExecable_"+Fvar+".exe & del CERTUTIL.tmp',shell=Fal"+
    "se,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)\n    try:"+
    "\n        subprocess.call('._TempExecable_"+Fvar+".exe')\n    except:\n        "+
    "subprocess.call('._TempExecable_"+Fvar+".exe', shell=True)")
    Fout.write("\n    os.remove('._TempExecable_"+Fvar+".exe')")
    Fout.write("\n\n")
    Fout.close()
    print("Finished!" + space32)
    gc.collect()
    print("Press any key to continue...", end='')
    sp.call("pause", shell=True)
    print('')
    pass

if __name__=='__main__':
    main()
